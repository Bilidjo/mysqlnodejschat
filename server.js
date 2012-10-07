var html = require('fs').readFileSync(__dirname+'/www/chatfbmysql/index.html');
var server = require('http').createServer(function(req, res){
    res.end(html);
});
server.listen(9863);

var mysql = require('db-mysql');
var nowjs = require('now');
var crypto = require('crypto')
var shasum = crypto.createHash('sha1');
shasum.update("utf8");


new mysql.Database({
    hostname: 'localhost',
    user: 'root',
    password: 'yourpassword',
    database: 'nodejschat'
}).connect(function(error) {
    if (error) {
        return console.log('CONNECTION error: ' + error);
    }
    /* */
    var db = this;
    var everyone = nowjs.initialize(server);
    var clients = {}; // Attention ne pas initialiser avec [] car bug lors de la transmission de la variable au client
    everyone.now.newClient = function(name, pwd){
        
        var context = this;
        // Chiffrage du pass en sha1
        var hash = crypto.createHash('sha1').update(pwd).digest("hex");
        // On test l'existance du compte
        db.query('SELECT id,avatar FROM users WHERE name="'+clean(name)+'" AND pwd="'+hash+'"').
        execute(function(error, rows, cols) {
            if (error) {
                console.log('ERROR: ' + error);
                return;
            }
            if(rows.length == 1){ // Le compte existe
                //On ajoute le client au tableau en renseignant son pseudo et son statut (connecté ou non)
                clients[context.user.clientId] =  {
                    login: name, 
                    statut: 1,
                    userid: rows[0].id,
                    avatar: rows[0].avatar,
                    friends: new Array
                };
                db.query('SELECT m.id,m.name FROM friends a LEFT JOIN users m ON m.id=IF(friend_1='+rows[0].id+',a.friend_2,a.friend_1) WHERE friend_1='+rows[0].id+' OR friend_2='+rows[0].id).
                execute(function(error, rows, cols) {
                    // On met à jour la liste des connectés
                    //console.log('nb amis : ' + rows.length);
                    //for(var r in rows) {
                    var friendList = new Array;
                    for(var i= 0; i < rows.length; i++)
                    {
                        friendList.push(rows[i].id);
                    }
                    clients[context.user.clientId].friends = friendList;
                    for(var c in clients) {
                        // Ce client est mon ami
                        if(friendList.inArray(clients[c].userid) || clients[c].userid == clients[context.user.clientId].userid){
                            nowjs.getClient(c, function(err) {
                                //Je lui raffraichie sa liste
                                this.now.updateClientList(getConnectedFriends(c),clients[c].login);
                            });
                        }
                    }
                });
                
            } else { // Pas d'erreur
                console.log('Mauvais id !');
            }
        });
        
    };
    
    function getConnectedFriends(idClient){
        
        var updatedList = {};
        var myFriends = clients[idClient].friends;
        for(var c in clients) {
            if(myFriends.inArray(clients[c].userid)){
                updatedList[c] = clients[c];
            }
         
        }
        return updatedList;
    }
    everyone.now.openChat = function(idClient){
        var idChat = idClient+this.user.clientId;
        var newChat = nowjs.getGroup(idChat);
        newChat.addUser(this.user.clientId);
        newChat.addUser(idClient);
        newChat.now.addChat(idChat,idClient,clients[idClient].login,clients[this.user.clientId].login);
    };

    everyone.now.sendMessage = function(message, room){
        var group = nowjs.getGroup(room);
        var idSender = this.user.clientId;
        group.count(function (ct) {
            if(ct <= 1) group.now.displayMessage(room, "Your friend isn't connected");
            else group.now.displayMessage(room, clients[idSender].login+': '+clean(message), clients[idSender].avatar);
        });
    };

    nowjs.on('disconnect', function() {
        var friendList = clients[this.user.clientId].friends;
        for(var i in clients) {
            if(i == this.user.clientId) {
                delete clients[i];
                break;
            }
        }
        for(var c in clients) {
            if(friendList.inArray(clients[c].userid)){
                nowjs.getClient(c, function(err) {
                    //Je lui raffraichie sa liste
                    this.now.updateClientList(getConnectedFriends(c),clients[c].login);
                });
            }
        }
    });

    function clean(html){
        return String(html).replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    
    Array.prototype.inArray = function(p_val) {
        var l = this.length;
        for(var i = 0; i < l; i++) {
            if(this[i] == p_val) {
                return true;
            }
        }
        return false;
    }
});
