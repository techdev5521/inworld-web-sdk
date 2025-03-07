import { v4 } from 'uuid';

import { InworldPacket as ProtoPacket } from '../proto/packets.pb';
import {
  LoadSceneRequest,
  LoadSceneResponseAgent,
} from '../proto/world-engine.pb';
import {
  Capabilities,
  Client,
  Extension,
  SessionToken,
  User,
} from '../src/common/data_structures';
import { protoTimestamp } from '../src/common/helpers';
import { QueueItem } from '../src/connection/web-socket.connection';
import { Character } from '../src/entities/character.entity';
import {
  DialogParticipant,
  PreviousDialog,
} from '../src/entities/continuation/previous_dialog.entity';
import { InworldPacket, PacketId } from '../src/entities/inworld_packet.entity';
import { ExtendedHistoryItem, ExtendedInworldPacket } from './data_structures';

const inOneHours = new Date();
inOneHours.setHours(inOneHours.getHours() + 1);

export const SCENE = v4();

export const createCharacter = () =>
  new Character({
    id: v4(),
    resourceName: v4(),
    displayName: v4(),
    assets: {
      rpmModelUri: v4(),
      rpmImageUriPortrait: v4(),
      rpmImageUriPosture: v4(),
    },
  });

export const createAgent = (): LoadSceneResponseAgent => {
  return {
    agentId: v4(),
    brainName: v4(),
    characterAssets: {
      rpmModelUri: v4(),
      rpmImageUriPortrait: v4(),
      rpmImageUriPosture: v4(),
    },
  };
};

export const convertAgentsToCharacters = (agents: LoadSceneResponseAgent[]) => {
  return agents.map(
    (agent: LoadSceneResponseAgent) =>
      new Character({
        id: agent.agentId,
        resourceName: agent.brainName,
        displayName: agent.givenName,
        assets: agent.characterAssets,
      }),
  );
};

export const session: SessionToken = {
  sessionId: v4(),
  token: v4(),
  type: 'Bearer',
  expirationTime: protoTimestamp(inOneHours),
};

export const generateSessionToken = () => Promise.resolve(session);

export const capabilitiesProps: Capabilities = {
  audio: true,
  continuation: true,
  emotions: true,
  interruptions: true,
  phonemes: true,
  silence: true,
  narratedActions: true,
  turnBasedStt: true,
};

export const user: User = {
  fullName: 'Full Name',
  id: 'id',
  profile: { fields: [{ id: 'field_1', value: 'value_1' }] },
};

export const client: Client = {
  id: 'ClientId',
};

export const writeMock = async (item: QueueItem<InworldPacket>) => {
  const packet = InworldPacket.fromProto(item.getPacket());
  await item.beforeWriting?.(packet);
  item.afterWriting?.(packet);
};

export const getPacketId = (): PacketId => ({
  packetId: v4(),
  interactionId: v4(),
  utteranceId: v4(),
});

export const convertPacketFromProto = (proto: ProtoPacket) => {
  const packet = InworldPacket.fromProto(proto) as ExtendedInworldPacket;

  packet.mutation = proto.mutation;

  return packet;
};

const beforeLoadScene = (req: LoadSceneRequest) => ({
  ...req,
  capabilities: {
    ...req.capabilities,
    regenerateResponse: true,
  },
});

export const extension: Extension<ExtendedInworldPacket, ExtendedHistoryItem> =
  {
    convertPacketFromProto,
    afterLoadScene: jest.fn(),
    beforeLoadScene: jest.fn().mockImplementation(beforeLoadScene),
  };

export const phrases = [
  {
    talker: DialogParticipant.CHARACTER,
    phrase: v4(),
  },
  {
    talker: DialogParticipant.PLAYER,
    phrase: v4(),
  },
  {
    talker: DialogParticipant.UNKNOWN,
    phrase: v4(),
  },
];
export const previousDialog = new PreviousDialog(phrases);
