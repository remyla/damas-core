from concurrent.futures import ThreadPoolExecutor

import discord
import json
import os
import asyncio
from flask import Flask, request, render_template
from async_timeout import timeout
from threading import Thread
from time import sleep

client = discord.Client()
messages = []
app = Flask(__name__)

def startClient():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    client.run('token')


#
# Discord Events
#
@client.event
async def on_ready():
    print('Discord Client Ready')

@client.event
async def on_message(message):
    global messages
    message.append(message)


#
# Flask Stuff
#
async def sendMsg(request):
    await client.send_message(discord.Object('channel id'), request.form['message'])


@app.route("/chat/", methods=['GET', 'POST'])
def chatPage():
    global messages

    if request.method == 'GET':
        return render_template('main.html')

    elif request.method == 'POST':
        loop = asyncio.new_event_loop()
        loop.run_until_complete(sendMsg(request))
        return ''

@app.route("/chat/get", methods=['GET'])
def chatGet():
    return json.dumps(messages[int(request.args['lastMessageId']):])


# Start everything
def main():
    # os.environ["WERKZEUG_RUN_MAIN"] = 'true'
    # print('Starting discord.py client')
    # Thread(target=startClient).start()
    # print('Starting flask')
    # app.run(host='0.0.0.0', debug=True)
    with ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(pow, 323, 1235)
        print(future.result())


if __name__ == '__main__':
    main()