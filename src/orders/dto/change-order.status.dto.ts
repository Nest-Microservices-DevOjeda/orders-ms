import { IsIn, IsUUID } from 'class-validator';
import { ORDER_STATUS, type OrderStatus } from 'src/common';

export class ChangeOrderStatusDto {
  @IsUUID()
  id: string;

  @IsIn(Object.values(ORDER_STATUS))
  status: OrderStatus;
}
