import async from 'async';
import { BaseInteraction, GuildMemberRoleManager, Message } from 'discord.js';
import { Roles } from 'models';

const getUser = (message: Message | BaseInteraction) =>
  (message as Message).author ?? (message as BaseInteraction).user ?? {};

/* eslint-disable no-shadow */
export enum PERMISSION {
  User = 'User',
  Administrator = 'Administrator',
  ServerOwner = 'Server Owner',
  BotAdmin = 'Bot Admin',
  BotOwner = 'Bot Owner',
}

export const PERM_LEVELS: {
  level: number;
  name: string;
  check: (message: Message | BaseInteraction, roles?: Roles) => Promise<boolean>;
  guildOnly?: boolean;
}[] = [
  // Lowest permission level, for users without a role.
  {
    level: 0,
    name: PERMISSION.User,
    check: async () => true,
  },
  {
    level: 7,
    name: PERMISSION.Administrator,
    check: async (message, roles) => {
      try {
        if (message.guild) {
          if (roles && message.member) {
            const adminRole = message.guild.roles.cache.find((r) => r.id === roles.admin);
            if (adminRole) {
              return (message.member.roles as GuildMemberRoleManager).cache.has(adminRole.id);
            }
          }
        }
        return false;
      } catch (e) {
        return false;
      }
    },
  },

  {
    level: 8,
    name: PERMISSION.ServerOwner,
    check: async (message) => message.guild?.ownerId === message.client.user.id,
  },

  // Has some limited access like rebooting the bot or reloading commands.
  {
    level: 9,
    name: PERMISSION.BotAdmin,
    check: async () => false,
  },

  /*
   * Bot owner, should be the highest permission level available.
   * Allow to run dangerous commands such as eval or exec.
   */
  {
    level: 10,
    name: PERMISSION.BotOwner,
    check: async (message) => getUser(message).id === process.env.BOT_OWNER,
  },
];

const ORDERED_PERM = PERM_LEVELS.slice(0).sort((p, c) => (p.level < c.level ? 1 : -1));

// Generate a cache of client permissions for pretty perm names in commands.
global.LevelCache = {};
PERM_LEVELS.forEach(({ name, level }) => {
  LevelCache[name] = level;
});

// Get the highest permission level
export const permLevel = async (
  message: Message | BaseInteraction,
  roles?: Roles
): Promise<number> => {
  const permlvl = await async.detectSeries(ORDERED_PERM, async (perm) => {
    if (!message.guild || !perm.guildOnly) {
      const pass = await perm.check(message, roles);
      return pass;
    }
    return true;
  });

  return permlvl?.level ?? 0;
};

export const readPermLevel = (level: number) =>
  PERM_LEVELS.find((perm) => perm.level === level)?.name;
