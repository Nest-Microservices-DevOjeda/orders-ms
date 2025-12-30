import { ORDER_STATUS, type OrderStatus } from 'src/common';
import { PaginationDto } from 'src/common/';
import { IsIn, IsOptional } from 'class-validator';

export class PaginationOrderDto extends PaginationDto {
  @IsIn(Object.values(ORDER_STATUS))
  @IsOptional()
  status?: OrderStatus;
}
