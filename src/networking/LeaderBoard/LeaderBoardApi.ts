
import {Db, MongoClient} from 'mongodb';

/*var mongo = require('mongodb');
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
var curl = require('node-curl');*/

export interface Settings {
    port: number;
    database: string;
    userTable: string;
    apiKey: string;
}

export class LeaderBoardApi
{
    settings : Settings;
    db: Db | null = null;

    constructor(settings : Settings)
    {
        this.settings = settings;

        //Setup server and connect to the database
        MongoClient.connect('localhost:27017', (err, client) => {
            this.db = client.db(this.settings.database);
            if(err) {
                console.log("ERROR connecting to " + this.settings.database + " database");
            } else {
                console.log("Connected to " + this.settings.database + " database");
            }
        });
    }

    remove(req : any, res : any)
    {
        var authToken = req.params.token;
        this.findUsersIdByToken(authToken, (userId : string) => {
            (this.db as Db).collection(this.settings.userTable, (err, collection) => {
                collection.remove({"userId": userId });
            });
        });
    }

    updateUser(req : any, res : any)
    {
        var authToken = req.params.token;

        this.findUsersIdByToken(authToken, (userId : string) => {

            //if got userId from authToken
            if (userId)
            {
                (this.db as Db).collection(this.settings.userTable, (err, collection) => {

                    collection.findOne({ 'userId': userId }, (err, item) => {

                        //TODO fix this up
                        if (item)
                        {
                            collection.update({ 'userId': userId }, { $inc: { "winCount": 1 } });
                            res.jsonp({ 'userId': userId });

                        } else
                        {
                            collection.insert({ 'userId': userId, 'winCount': 1 });
                            res.jsonp({ 'userId': userId, 'winCount': 1 });
                        }
                    });

                });
            } else
            {
                //If we where unable to get the userId from the authToken
                res.jsonp({ 'Error': "Failed to auth" });
            }

        });

    }

    getLeaderBoard(req : any, res : any)
    {
        console.log(res);
        (this.db as Db).collection(this.settings.userTable, (err, collection) => {
            collection.find().sort({ "winCount": -1 }).toArray(function (err, items)
            {
                console.log(items);
                res.jsonp(JSON.stringify(items));
            });
        });
    }

    //Given a authToken, it will retrive the userId of the authenetiated user
    findUsersIdByToken(authToken : string, callback : CallableFunction)
    {
        callback(authToken);

        /*var url = 'https://www.googleapis.com/plus/v1/people/me?key=' + this.settings.apiKey + '&access_token=' + authToken;
        //console.log(url);
        curl(url, function (err)
        {

            //console.log(this.body);
            var userId = JSON.parse(this.body).id;
            callback(userId);
        });*/
    }

}