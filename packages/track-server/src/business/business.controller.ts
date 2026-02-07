import { Controller, Get, Post, Body, Query } from '@nestjs/common'
import { BusinessService } from './business.service'

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get('analysis')
  async getAnalysis(@Query() params: any) {
    return this.businessService.getAnalysis(params)
  }

  @Post('alert')
  async createAlert(@Body() alert: any) {
    return this.businessService.createAlert(alert)
  }

  @Get('user-behavior')
  async getUserBehavior(@Query('userId') userId: number) {
    return this.businessService.getUserBehaviors(userId)
  }
}
