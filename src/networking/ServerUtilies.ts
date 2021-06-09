
export module ServerUtilies
{
    export function findByValue(needle : any, haystack : any[], haystackProperity : any, )
    {

        for (var i = 0; i < haystack.length; i++)
        {
            if (haystack[i][haystackProperity] === needle)
            {
                return haystack[i];
            }
        }
        throw "Couldn't find object with proerpty " + haystackProperity + " equal to " + needle;
    }

    export function deleteFromCollection(collection : any[], indexToRemove : number)
    {
        delete collection[indexToRemove];
        collection.splice(indexToRemove, 1);
    }

    export function createToken()
    {
        return Math.random().toString(36).substr(2);
    }

    /*export function info(io,message)
    {
        if (ServerSettings.DEVELOPMENT_MODE)
              io.log.info(Util.format("@ " + message));
    }

    export function warn(io,message)
    {
        if (Settings.DEVELOPMENT_MODE)
           io.log.warn(Util.format("@ " + message));
    }

    export function debug(io,message)
    {
        if (ServerSettings.DEVELOPMENT_MODE)
               io.log.debug(Util.format("@ " + message));
    }

    export function error(io,message)
    {
        if (ServerSettings.DEVELOPMENT_MODE)
                io.log.error(Util.format("@ " + message));
    }*/
}