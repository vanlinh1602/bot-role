import { Client } from 'discord.js';
import { RoleInviteConfig } from 'models';

export const handler = async (client: Client) => {
  Logger.info(`Ready! Logged in as ${client.user?.tag}`);
  const allRoleInviteConfigs = await RoleInviteConfig.findAll();
  await Promise.all(
    allRoleInviteConfigs.map(async (config) => {
      const invite = await client.guilds.cache.get(config.guildId)?.invites.fetch();
      const cacheCount = invite?.get(config.inviteCode)?.uses ?? 0;
      await RoleInviteConfig.update(
        { cacheCount },
        { where: { guildId: config.guildId, inviteCode: config.inviteCode } }
      );
    })
  );
};
