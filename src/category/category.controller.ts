import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('categories')
@UseGuards(JwtAuthGuard) 
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une catégorie' })
  @ApiResponse({ status: 201, description: 'Catégorie créée.' })
  @ApiResponse({ status: 409, description: 'Nom déjà utilisé.' })
  create(@Body() createCategoryDto: CreateCategoryDto, @Request() req) {
    return this.categoryService.create(createCategoryDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Lister toutes les catégories' })
  findAll(@Request() req) {
    return this.categoryService.findAll(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Voir une catégorie' })
  @ApiResponse({ status: 404, description: 'Catégorie introuvable.' })
  findOne(@Param('id') id: number, @Request() req) {
    return this.categoryService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une catégorie' })
  @ApiResponse({ status: 409, description: 'Nom déjà utilisé.' })
  update(@Param('id') id: number, @Body() updateCategoryDto: UpdateCategoryDto, @Request() req) {
    return this.categoryService.update(id, req.user, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une catégorie' })
  remove(@Param('id') id: number, @Request() req) {
    return this.categoryService.remove(id, req.user);
  }
}
