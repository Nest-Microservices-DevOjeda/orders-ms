import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ProductForOrderDto } from 'src/common';
import { PRODUCT_SERVICE } from 'src/config';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ChangeOrderStatusDto,
  CreateOrderDto,
  PaginationOrderDto,
} from './dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(PRODUCT_SERVICE)
    private readonly productsClient: ClientProxy,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const productIds = createOrderDto.items.map((item) => item.productId);

    const products = await this.getProductsForOrder(productIds);

    const productsPriceMap = new Map<number, number>(
      products.map((product) => [product.id, product.price]),
    );

    const productsNameMap = this.getProductsNameMap(products);

    const totalAmount = createOrderDto.items.reduce((total, item) => {
      const productPrice = productsPriceMap.get(item.productId) ?? 0;

      if (productPrice === 0) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `Product with ID ${item.productId} not found`,
        });
      }

      return total + productPrice * item.quantity;
    }, 0);

    const totalItems = createOrderDto.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    // crear transaccion de la orden
    // crear los items de la orden
    const itemData = createOrderDto.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: productsPriceMap.get(item.productId) ?? 0,
    }));

    // crear la orden con los items
    const order = await this.prismaService.order.create({
      data: {
        totalAmount,
        totalItems,
        items: {
          createMany: {
            data: itemData,
          },
        },
      },
      include: {
        items: true,
        _count: true,
      },
    });

    return {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        name: productsNameMap.get(item.productId) ?? '',
      })),
    };
  }

  async findAll(paginationOrderDto: PaginationOrderDto) {
    const { limit, page, status } = paginationOrderDto;
    const totalOrders = await this.prismaService.order.count({
      where: status ? { status } : {},
    });
    const totalPages = Math.ceil(totalOrders / limit);
    const skip = (page - 1) * limit;

    if (page > totalPages && totalOrders > 0) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Page ${page} exceeds total pages ${totalPages}`,
      });
    }

    const orders = await this.prismaService.order.findMany({
      take: limit,
      skip,
      where: status ? { status } : {},
    });
    return {
      data: orders,
      meta: {
        page,
        limit,
        totalPages,
        totalOrders,
      },
    };
  }

  async findOne(id: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with ID ${id} not found`,
      });
    }

    const products = await this.getProductsForOrder(
      order.items.map((item) => item.productId),
    );

    const productsNameMap = this.getProductsNameMap(products);

    return {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        name: productsNameMap.get(item.productId) ?? '',
      })),
    };
  }

  async changeOrderStatus(changeOrderStatusDto: ChangeOrderStatusDto) {
    const { id, status } = changeOrderStatusDto;

    await this.findOne(id);

    return await this.prismaService.order.update({
      where: { id },
      data: { status },
    });
  }

  private getProductsNameMap(
    products: ProductForOrderDto[],
  ): Map<number, string> {
    return new Map<number, string>(
      products.map((product) => [product.id, product.name]),
    );
  }

  private async getProductsForOrder(
    productIds: number[],
  ): Promise<ProductForOrderDto[]> {
    return await firstValueFrom(
      this.productsClient.send<ProductForOrderDto[]>(
        { cmd: 'validate_products' },
        { productIds },
      ),
    );
  }
}
