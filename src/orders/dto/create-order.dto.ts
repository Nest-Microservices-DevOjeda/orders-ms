import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { ORDER_STATUS, type OrderStatus } from 'src/common';

export class CreateOrderDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  totalAmount: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  totalItems: number;

  @IsIn(Object.values(ORDER_STATUS))
  @IsOptional()
  status?: OrderStatus;

  @IsBoolean()
  @IsOptional()
  paid?: boolean;
}
