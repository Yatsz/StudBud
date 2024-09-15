import json
from ai_engine.chitchat import ChitChatDialogue
from ai_engine.messages import DialogueMessage
from uagents import Agent, Context, Model

# agent = Agent()

agent = Agent(
    name="chit_agent",
    seed="wifiwsucks",
    port=8001,
    endpoint="http://127.0.0.1:8001/submit",
)


class InitiateChitChatDialogue(Model):
    """I initiate ChitChat dialogue request"""

    pass


class AcceptChitChatDialogue(Model):
    """I accept ChitChat dialogue request"""

    pass


class ChitChatDialogueMessage(DialogueMessage):
    """ChitChat dialogue message"""

    pass


class ConcludeChitChatDialogue(Model):
    """I conclude ChitChat dialogue request"""

    pass


class RejectChitChatDialogue(Model):
    """I reject ChitChat dialogue request"""

    pass


async def get_symbol(company_name):
    return f"Get Symbol."


async def get_stock_price(symbol):
    return f"Get Stock."


chitchat_dialogue = ChitChatDialogue(
    version="0.11.1",
    storage=agent.storage,
)


async def process_message(self, message):
    ctx = Context()
    await self.send(ctx.session, ChitChatDialogueMessage(user_message=message))
    response = await self.receive(ctx.session)
    return response.agent_message


agent.process_message = process_message.__get__(agent)


@chitchat_dialogue.on_initiate_session(InitiateChitChatDialogue)
async def start_chitchat(ctx: Context, sender: str, msg: InitiateChitChatDialogue):
    ctx.logger.info(f"Received init message from {sender} Session: {ctx.session}")
    await ctx.send(sender, AcceptChitChatDialogue())


@chitchat_dialogue.on_start_dialogue(AcceptChitChatDialogue)
async def accepted_chitchat(ctx: Context, sender: str, _msg: AcceptChitChatDialogue):
    ctx.logger.info(
        f"session with {sender} was accepted. This shouldn't be called as this agent is not the initiator."
    )


@chitchat_dialogue.on_reject_session(RejectChitChatDialogue)
async def reject_chitchat(ctx: Context, sender: str, _msg: RejectChitChatDialogue):
    ctx.logger.info(f"Received conclude message from: {sender}")


@chitchat_dialogue.on_continue_dialogue(ChitChatDialogueMessage)
async def continue_chitchat(ctx: Context, sender: str, msg: ChitChatDialogueMessage):
    ctx.logger.info(f"Received message: {msg.user_message} from: {sender}")
    symbol = await get_symbol(msg.user_message)
    stock_price = await get_stock_price(symbol)
    final_string = f"The price for your {msg.user_message} is $ {stock_price}"
    try:
        await ctx.send(
            sender,
            ChitChatDialogueMessage(type="agent_message", agent_message=final_string),
        )
    except EOFError:
        await ctx.send(sender, ConcludeChitChatDialogue())


@chitchat_dialogue.on_end_session(ConcludeChitChatDialogue)
async def conclude_chitchat(ctx: Context, sender: str, _msg: ConcludeChitChatDialogue):
    ctx.logger.info(f"Received conclude message from: {sender}; accessing history:")
    ctx.logger.info(chitchat_dialogue.get_conversation(ctx.session))


agent.include(chitchat_dialogue, publish_manifest=True)

if __name__ == "__main__":
    print(f"Agent address: {agent.address}")
    agent.run()
