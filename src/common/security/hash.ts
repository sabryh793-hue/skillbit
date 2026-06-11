import * as bcrypt from 'bcryptjs';

export const Hash = async (data: string,saltRound: number=10): Promise<string> => {
  return await bcrypt.hash(data, saltRound)
}

export const compare = async ( data: string, hashed: string,): Promise<boolean> => {
  return await bcrypt.compare(data, hashed)
}
//arrow functions in more modern and efficient way for nestjs and typescript.