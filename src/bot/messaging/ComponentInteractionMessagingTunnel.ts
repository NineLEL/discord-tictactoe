import MessagingTunnel, { MessagingAnswer } from '@bot/messaging/MessagingTunnel';
import { GuildMember, Message, MessageComponentInteraction, TextChannel } from 'discord.js';

/**
 * Represents an interaction messaging channel
 * to operate interactions from a message component.
 *
 * @author Utarwyn
 * @since 3.0.0
 */
export default class ComponentInteractionMessagingTunnel extends MessagingTunnel {
    /**
     * Interaction object retrieved from the Discord API
     * @private
     */
    private readonly interaction: MessageComponentInteraction;
    /**
     * Last reply sent into the tunnnel
     * @private
     */
    private _reply?: Message;

    /**
     * Constructs a new messaging
     * tunnel using Discord interactions.
     *
     * @param interaction interaction generic object
     */
    constructor(interaction: MessageComponentInteraction) {
        super();
        this.interaction = interaction;
    }

    /**
     * @inheritdoc
     */
    public get author(): GuildMember {
        return this.interaction.member as GuildMember;
    }

    /**
     * @inheritdoc
     */
    public get channel(): TextChannel {
        return this.interaction.channel as TextChannel;
    }

    /**
     * @inheritdoc
     */
    public get reply(): Message | undefined {
        return this._reply;
    }

    /**
     * @inheritdoc
     */
    public async replyWith(answer: MessagingAnswer, _direct?: boolean): Promise<Message> {
        if (this._reply) {
            await this.interaction.editReply(answer);
        } else {
            this._reply = (await this.interaction.update({
                ...answer,
                fetchReply: true
            })) as Message;
        }

        return this._reply;
    }

    /**
     * @inheritdoc
     */
    public async editReply(answer: MessagingAnswer): Promise<void> {
        await this.replyWith(answer);
    }

    /**
     * @inheritdoc
     */
    public async end(reason?: MessagingAnswer): Promise<void> {
        try {
            await this.editReply(reason ?? { content: '.', components: [], embeds: [] });
            await (this.interaction.message as Message).reactions.removeAll();
        } catch (e) {
            // ignore api error
        }
    }
}
