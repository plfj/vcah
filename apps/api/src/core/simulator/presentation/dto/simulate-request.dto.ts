import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class SimulateRequestDto {
  @IsString()
  @IsNotEmpty()
  bytecode!: string;

  @IsOptional()
  @IsNumber()
  seed?: number;

  @IsOptional()
  @IsNumber()
  maxCycles?: number;
}
