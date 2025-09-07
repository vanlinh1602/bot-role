import { PERMISSION } from 'configs/permissions';
import { Client } from 'discord.js';
import { RoleInviteConfig } from 'models';
import type { SlashCmd } from 'types';

export const run: SlashCmd['run'] = async (client: Client, interaction: any) => {
  await interaction.deferReply();
  const inviteCode = interaction.options.get('invite_code')?.value as string;
  const role = interaction.options.get('role')?.value as string;

  if (!inviteCode || !role) {
    await interaction.editReply('Invalid invite code or role');
    return;
  }

  const existingConfig = await RoleInviteConfig.findOne({
    where: { guildId: interaction.guildId, inviteCode },
  });

  if (existingConfig) {
    await interaction.editReply('Invite code already exists');
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
  } else {
    await interaction.editReply('Invite code not found');
    return;
  }
  await interaction.editReply('Invite role added');
};

export const data: SlashCmd['data'] = {
  name: 'add_invite_role',
  description: 'Add invite role',
  options: [
    {
      name: 'invite_code',
      description: 'Invite code',
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
  permLevel: PERMISSION.Administrator,
  guildOnly: false,
};
