import { Client, EmbedBuilder, GuildMember, TextChannel } from 'discord.js';
import { RoleInviteConfig } from 'models';

// Emitted whenever the client joins a guild.
export const handler = async (client: Client, member: GuildMember) => {
  if (member.user.bot) return;
  const newInvites = await member.guild.invites.fetch();
  const allRoleInviteConfigs = await RoleInviteConfig.findAll({
    where: { guildId: member.guild.id },
  });

  // Tìm invite nào tăng số lượt dùng
  const usedInvite = allRoleInviteConfigs.find(
    (config) => newInvites.get(config.inviteCode)?.uses ?? 0 > config.cacheCount
  );

  if (usedInvite) {
    console.log(`${member.user.tag} đã join bằng link: ${usedInvite.inviteCode}`);
    // Ví dụ mapping invite → role
    const roleId = usedInvite.roleId;
    if (roleId) {
      const role = member.guild.roles.cache.get(roleId);
      if (role) {
        await member.roles.add(role);
        console.log(`Đã gán role ${role.name} cho ${member.user.tag}`);
      }
    }
    await RoleInviteConfig.update(
      { cacheCount: newInvites.get(usedInvite.inviteCode)?.uses ?? 0 },
      { where: { guildId: member.guild.id, inviteCode: usedInvite.inviteCode } }
    );
  }

  // Cập nhật cache
};
