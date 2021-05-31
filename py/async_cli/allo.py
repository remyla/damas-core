import asyncio
import time


def callback(resp):
    print(resp)


async def commande(param):
    await asyncio.sleep(5)
    return (param % 2 == 0)
    await print("commande {} pret".format(param))
    #callback("assis toi , attend la cmd")


async def main():
    res = await commande(2)
    tasks = [ commande(n) for n in range(5)]
    task_res = await asyncio.gather(*tasks)
    if (res == True):
        print("exit succes")
    else:
        print("exit failure")

if __name__ == '__main__':
    asyncio.run(main())
