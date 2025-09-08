import { PERMISSION } from 'configs/permissions';
import { Client } from 'discord.js';
import { RoleInviteConfig } from 'models';
import type { SlashCmd } from 'types';

export const run: SlashCmd['run'] = async (client: Client, interaction: any) => {
  await interaction.deferReply();
  const inviteCode = interaction.options.get('invite_code')?.value as string;
  const role = interaction.options.get('role')?.value as string;

  if (!inviteCode || !role) {
    await interaction.editReply('Vui lòng nhập mã invite và role');
    return;
  }

  const existingConfig = await RoleInviteConfig.findOne({
    where: { guildId: interaction.guildId, inviteCode },
  });

  if (existingConfig) {
    await interaction.editReply('Mã invite đã tồn tại');
    return;
  }

  const invites = await client.guilds.cache.get(interaction.guildId!)?.invites.fetch();
  const invite = invites?.find((inv) => inv.code === inviteCode);
  if (invite) {
    const cacheCount = invite.uses ?? 0;
    await RoleInviteConfig.create({
      guildId: interaction.guildId,
      inviteCode,
      roleId: role,
      cacheCount,
    });
    await interaction.editReply(`Cấu hình <@&${role}> cho mã mời ${inviteCode} thành công`);
  } else {
    await interaction.editReply('Mã invite không tồn tại');
  }
};

export const data: SlashCmd['data'] = {
  name: 'add_invite_role',
  description: 'Thêm role vào mã invite',
  options: [
    {
      name: 'invite_code',
      description: 'Mã mời vào server',
      type: 3,
      required: true,
    },
    {
      name: 'role',
      description: 'Role',
      type: 8,
      required: true,
    },
  ],
  defaultPermission: true,
};

export const conf: SlashCmd['conf'] = {
  permLevel: PERMISSION.ServerOwner,
  guildOnly: true,
};
