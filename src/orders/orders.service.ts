import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ORDER_STATUS } from 'src/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ChangeOrderStatusDto,
  CreateOrderDto,
  PaginationOrderDto,
} from './dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createOrderDto: CreateOrderDto) {
    const {
      paid: paidFromDto,
      status: statusFromDto,
      ...data
    } = createOrderDto;

    const paid = paidFromDto ?? false;
    const status = statusFromDto ?? ORDER_STATUS.PENDING;

    return this.prismaService.order.create({
      data: {
        ...data,
        paid,
        status,
      },
    });
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
    });

    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with ID ${id} not found`,
      });
    }

    return order;
  }

  async changeOrderStatus(changeOrderStatusDto: ChangeOrderStatusDto) {
    const { id, status } = changeOrderStatusDto;

    await this.findOne(id);

    return await this.prismaService.order.update({
      where: { id },
      data: { status },
    });
  }
}
