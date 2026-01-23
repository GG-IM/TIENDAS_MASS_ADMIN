import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Categoria } from './Categoria.entity';
import { Producto } from './Producto.entity';
import { Estado } from './Estado.entity';

@Entity('Subcategorias')
export class Subcategoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @ManyToOne(() => Categoria, categoria => categoria.subcategorias)
  categoria: Categoria;

  @OneToMany(() => Producto, producto => producto.subcategoria, { nullable: true })
  productos: Producto[];

  @ManyToOne(() => Estado, estado => estado.subcategorias)
  estado: Estado;
}
