import { DataTypes, Model } from 'sequelize';

export class Roles extends Model {
  declare guildId: string;

  declare admin: string;
}

Roles.init(
  {
    guildId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    admin: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize: Database,
  }
);
