import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guard/jwt-auth.guard.js";
import { User } from "../../common/decorator/user.decorator.js";
import type { JwtPayLoad } from "../auth/auth.type.js";
import { DashboardService } from "./dashboard.service.js";
import type { AnalyticsQuery, DashboardQuery } from "./dashboard.type.js";

@Controller("dashboard")
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get("summary")
  async getSummary(@User() user: JwtPayLoad, @Query() query: DashboardQuery) {
    return this.service.getSummary(user.id, query);
  }

  @Get("analytics")
  async getAnalytics(@User() user: JwtPayLoad, @Query() query: AnalyticsQuery) {
    return this.service.getAnalytics(user.id, query);
  }
}
