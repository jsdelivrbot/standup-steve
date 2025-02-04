const Botmock = require('botkit-mock');
const { startDmEmojiInterview, createNewUser } = require('../skills/startDmEmojiInterview');
const { joinChannel } = require('../skills/joinChannel');
const { createChannelStandup } = require('../skills/createChannelStandup');
const Channel = require('../repositories/channel');
const User = require('../repositories/user');

const controller = Botmock({});
const testBot = controller.spawn({type: 'slack', token: 'test_token'});

const message = {
  item: {  
    channel: 'C0VHNJ7MF',
  },
  match:
    [ 'create standup 11am',
      'create',
      '11am',
    ],
  user: 'memeber1',
  reation: ':wave:'
};

describe.only('start DM Emoji interview funcitonality', () => {
  describe('createNewUser', () => {
    test('creates new users if they dont already exist', async () => {
      const usersBefore = await User.getAll(testBot);

      await createNewUser(testBot, 'member1')

      const usersAfter = await User.getAll(testBot);
      expect(usersAfter).not.toEqual({});
    });
  });

  describe('startDmEmojiInterview', () => {
    test('kicks off interview with user', async () => {
      await startDmEmojiInterview(testBot, message)

      // TODO: need to integrate `standups` as storage table option
      // console.log(testBot.botkit.storage);
    });
  });
});
