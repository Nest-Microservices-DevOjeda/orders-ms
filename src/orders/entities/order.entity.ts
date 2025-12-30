export class Order {
  constructor(
    public id: string,
    public customerId: string,
    public totalAmount: number,
    public status: string,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
