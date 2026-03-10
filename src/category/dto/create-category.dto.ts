import { ApiProperty } from "@nestjs/swagger";
import { IsHexColor, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class CreateCategoryDto {
    @ApiProperty({ example: 'Travail', description: 'Nom de la catégorie' })
    @IsString()
    @Length(1, 100)
    name: string;

    @ApiProperty({ example: '#6366f1', description: 'Couleur hexadécimale', required: false })
    @IsOptional()
    @IsHexColor()
    color?: string;
}
