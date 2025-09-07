import { DEFAULT_SETTINGS } from 'configs';
import { DataTypes, Model } from 'sequelize';

export class RoleInviteConfig extends Model {
  declare guildId: string;

  declare inviteCode: string;

  declare roleId: string;

  declare cacheCount: number;
}

RoleInviteConfig.init(
  {
    guildId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    inviteCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cacheCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize: Database,
  }
);
