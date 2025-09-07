import type { ApplicationCommandData, Client, CommandInteraction, Message } from 'discord.js';

export type SlashCmd = {
  conf: {
    permLevel: string;
    guildOnly: boolean;
  };
  data: ApplicationCommandData & { defaultPermission: boolean };
  run: (client: Client, interaction: CommandInteraction, options: {}) => Promise<void>;
};

export type Command = {
  conf: {
    enabled: boolean;
    guildOnly: boolean;
    aliases: string[];
    permLevel: string;
  };
  help: {
    name: string;
    category: string;
    description: string;
    usage: string;
  };
  run: (
    client: Client,
    message: Message,
    args: string[],
    level: number,
    options: { flags?: string[] }
  ) => Promise<void>;
};
