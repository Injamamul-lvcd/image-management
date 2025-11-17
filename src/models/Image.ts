import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ImageAttributes {
  id: number;
  userId: number;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ImageCreationAttributes extends Optional<ImageAttributes, 'id'> {}

class Image extends Model<ImageAttributes, ImageCreationAttributes> implements ImageAttributes {
  public id!: number;
  public userId!: number;
  public filename!: string;
  public originalName!: string;
  public mimetype!: string;
  public size!: number;
  public path!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Image.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    originalName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mimetype: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'images',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id'],
      },
    ],
  }
);

export default Image;
