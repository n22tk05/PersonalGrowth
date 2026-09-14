import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CategoryResponse } from "./category.type.js";
import CategoryRepository from "./category.repository.js";
import { CreateCategoryDto, UpdateCategoryDto } from "./category.dto.js";

@Injectable()
export default class CategoryService {
  constructor(private readonly repository: CategoryRepository) {}

  async categories(userId: string): Promise<CategoryResponse[]> {
    const categories = await this.repository.finds(userId);
    if (!categories) throw new HttpException("Not found", HttpStatus.NOT_FOUND);

    return categories.map((curr) => this.mapToCategoryResponse(curr));
  }

  async category(id: string, userId: string): Promise<CategoryResponse> {
    if(!id || !userId) throw new HttpException("Bad request", HttpStatus.BAD_REQUEST)
    const category = await this.repository.findById(id);
    if (!category) throw new HttpException("Not found", HttpStatus.NOT_FOUND);
    if (category.userId !== userId) throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    return this.mapToCategoryResponse(category);
  }

  async update(dto: UpdateCategoryDto, id: string, userId: string) {
    if(!id || !userId) throw new HttpException("Bad request", HttpStatus.BAD_REQUEST)
    const category = await this.repository.findById(id);
    if (!category) throw new HttpException("Not found", HttpStatus.NOT_FOUND);
    if (category.userId !== userId) throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);

    const update = await this.repository.update(dto, id)
    return this.mapToCategoryResponse(update)
  }

  async create(dto: CreateCategoryDto, userId: string) {
    if(!userId) throw new HttpException("Bad request", HttpStatus.BAD_REQUEST)
    const create = await this.repository.create(dto, userId)
    if(!create) throw new HttpException("Bad request", HttpStatus.BAD_REQUEST)

    return this.mapToCategoryResponse(create)
  }

  async delete(id: string, userId: string) {
    if(!id || !userId) throw new HttpException("Bad request", HttpStatus.BAD_REQUEST)
    const category = await this.repository.findById(id);
    if (!category) throw new HttpException("Not found", HttpStatus.NOT_FOUND);
    if (category.userId !== userId) throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);

    await this.repository.delete(id)
  }


  private mapToCategoryResponse(cate: any): CategoryResponse {
    return {
      id: cate.id,
      name: cate.name,
      color: cate.color,
      icon: cate.icon,
      createdAt: cate.createdAt,
    };
  }
}
