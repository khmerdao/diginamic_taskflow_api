import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterDto {
    @ApiProperty({ example: 'john_doe', description: "Nom d'utilisateur" })
    @IsString()
    username: string;

    @ApiProperty({ example: 'john@exemple.com', description: 'Adresse email' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '123456', description: 'Mot de passe (min 6 caractères)' })
    @IsString()
    @MinLength(6)
    password: string;
}
