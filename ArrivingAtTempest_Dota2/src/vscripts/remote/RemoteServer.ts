import { DotaPromise } from "../utils/DotaPromise";

interface EmptyResponse {

}

interface InitGameResponse extends EmptyResponse{
    id: string;
    players: IPlayerSchema[];
}

interface IPlayerSchema {
    steamId: string;
    playerName?: string;
    premium?: boolean;
    allowTrade?: boolean;
    allowPlay?: boolean;
}

export enum RouteKey {
    PING,
    GAME_INIT
}

enum HttpRequest{
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE"
}

interface RoutesInfo {
    path: string;
    method: HttpRequest;
}

const Routes: { [key in RouteKey]: RoutesInfo } = {
    [RouteKey.PING]: {
        path: "/api/info/ping",
        method: HttpRequest.GET
    },
    [RouteKey.GAME_INIT]: {
        path: "/api/game/init",
        method: HttpRequest.POST
    }
};

type RouteParams = {
    [RouteKey.PING]: undefined,
    [RouteKey.GAME_INIT]: { steamIds: string[]},
}

type RouteResponses = { 
    [RouteKey.PING]: EmptyResponse,
    [RouteKey.GAME_INIT]: InitGameResponse,
};

class Server {

    isOnline = false;
    routeMap: Record<RouteKey, RoutesInfo> = {} as any;
    uniqueGameId!: string;

    constructor(private name: string) {
        for (let [key, value] of pairs(Routes)) {
            this.routeMap[key] = {
                path: name + value.path,
                method: Routes[key].method
            }
        }

        // DeepPrintTable(this.routeMap);
    }

    ping(): DotaPromise<RouteResponses[RouteKey.PING], number> {
        return new DotaPromise<RouteResponses[RouteKey.PING], number>(
            (resolve, reject) => {
                const request = this.CreateRequest(this.routeMap[RouteKey.PING].method, this.routeMap[RouteKey.PING].path);
                if (!request) {
                    this.isOnline = false;
                    reject(-1);
                    return;
                }
                request.Send((response) => {
                    this.isOnline = response.StatusCode == 200;
                    if(this.isOnline){
                        resolve(response.Body);
                    } else {
                        reject(response.StatusCode);
                    }
                });
            }
        );
    }

    doCall<T extends RouteKey>(key: T, data?: RouteParams[T]): DotaPromise<RouteResponses[T], number> {
        return new DotaPromise<RouteResponses[T], number>(
            (resolve, reject) => {
                const request = this.CreateRequest(this.routeMap[key].method, this.routeMap[key].path, data);
                if (!request) {
                    reject(-1);
                    return;
                }
                request.Send(this.DefaultResponse(resolve, reject));
            }
        );
    }

    private DefaultResponse<T>(resolve: (result: T) => void, reject: (result: number) => void){
        return function (this: void, response: CScriptHTTPResponse) {
            if(response.StatusCode == 200){
                if(response.Body){
                    const [result, statusCode, message] = json.decode(response.Body, 1, null);
                    if(message){
                        print("Failed to parse json response: ", message, " statuscode: ", statusCode);
                        reject(statusCode);
                    } else {
                        resolve(result);
                    }
                } else {
                    resolve({} as T);
                }
            } else {
                reject(response.StatusCode);
            }
        };
    }

    private CreateRequest(type: HttpRequest, route: string, data?: any){
        const request = CreateHTTPRequestScriptVM(type, route);
        if(data){
            if(type == HttpRequest.POST ){
                request.SetHTTPRequestRawPostBody("application/json", json.encode(data));
            } else {
                for(let [key, value] of pairs(data)){
                    request.SetHTTPRequestGetOrPostParameter(key as string, value);
                }
            }
        }
        request.SetHTTPRequestHeaderValue("authorization", GetDedicatedServerKeyV2(GameRules.Addon.gameVersion));
        request.SetHTTPRequestHeaderValue("gameId", this.uniqueGameId);

        return request;
    }
}

export const RemoteServer = new Server("http://localhost"); 