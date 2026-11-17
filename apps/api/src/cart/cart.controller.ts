import { Body, Controller, Delete, Get, Headers, Param, Put } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private cart: CartService) {}

  private cartId(header?: string) {
    return header?.trim() || randomUUID();
  }

  @Get()
  async get(@Headers('x-cart-id') header?: string) {
    const id = this.cartId(header);
    const cart = await this.cart.getCart(id);
    return { cartId: id, ...cart };
  }

  @Put('items')
  async setItem(
    @Headers('x-cart-id') header: string | undefined,
    @Body() body: { variantId: string; quantity: number },
  ) {
    const id = this.cartId(header);
    const cart = await this.cart.setItem(id, body.variantId, body.quantity);
    return { cartId: id, ...cart };
  }

  @Delete('items/:variantId')
  async remove(@Headers('x-cart-id') header: string | undefined, @Param('variantId') variantId: string) {
    const id = this.cartId(header);
    const cart = await this.cart.removeItem(id, variantId);
    return { cartId: id, ...cart };
  }
}
