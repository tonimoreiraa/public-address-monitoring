import axios from 'axios'
import servers from './servers.json'

const address = process.argv[2]

type Server = {
    serverName: string
    serverAddress: string
    serverId: string
}

async function testLink(server: Server, index: number)
{
    const url = `http://${server.serverAddress}/PING/${address}?trID=${index}&nPing=1&_=1702312255888`

    const response = []

    for (var i = 0; i < 5; i++) {
        try {
            const { data } = await axios.get(url, {
                timeout: 6000
            })
            response.push({ type: !data.err ? 'online' : 'timeout', ...data })
        } catch (e: any) {
            response.push({
                type: 'offline'
            })
        }
    }

    return {
        ...server,
        response
    }
}

async function main()
{
    const promises = []
    for (var i = 0; i < servers.length; i++) {
        const server = servers[i]
        const [
            serverId,
            serverName,
            serverAddress,
        ] = server
        
        const promise = testLink({
            serverId,
            serverName,
            serverAddress
        } as Server, i)
        promises.push(promise)
    }

    const data = (await Promise.all(promises))
        .map(x => x.response)
        .reduce((x, y) => [...x, ...y], [])

    const total = data.length
    const offlineCount = data.filter(i => i.type == 'offline').length
    const onlineCount = data.filter(i => i.type == 'online').length
    const timeoutCount = data.filter(i => i.type == 'timeout').length
    const average = data.filter(i => i.type == 'online')
        .map(i => i.ms)
        .reduce((x, y) => x + y) / onlineCount

    for (const row of data.filter(i => i.type == 'online')) {
        if (isNaN(Number(row.ms))) {
            console.log(row)
        }
    }

    const response = {
        total, offlineCount, onlineCount, timeoutCount, average
    }

    console.log(JSON.stringify(response))
}

main()
