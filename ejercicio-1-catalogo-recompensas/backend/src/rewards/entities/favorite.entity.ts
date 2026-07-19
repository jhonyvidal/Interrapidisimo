import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

// Existencia de la fila = producto marcado como favorito por ese usuario.
// El unique constraint es lo que hace idempotente el award de puntos:
// no se puede volver a "crear" el mismo favorito para ganar puntos de nuevo.
@Entity('favorites')
@Unique(['userId', 'productId'])
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  productId: number;

  @CreateDateColumn()
  createdAt: Date;
}
