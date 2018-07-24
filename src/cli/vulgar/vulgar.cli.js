"use strict";
const player = require('play-sound')({});
const glob = require("glob");
const _ = require("lodash");

const getRandomNoise = ()=>{
    let fileNames = glob.sync(`${__dirname}/mp3s/**/*`,{});
    return _.sample(fileNames);
};


module.exports = (larryCli)=>{
    //setup midnight prompt
    larryCli.delimiter(larryCli.chalk.blue('8==larry==>'));

    //expose ripper
    larryCli
        .command('pbbbt [mp3]', 'Who farted?')
        .action((args, callback) => {
            let mp3ToPlay;
            if(args.mp3){
                mp3ToPlay = args.mp3;
            }
            else{
                mp3ToPlay = getRandomNoise();
            }
            if(mp3ToPlay){
                player.play(mp3ToPlay, (err)=>{
                    if (err) {
                        larryCli.log(larryCli.chalk.red(`Failed to pbbbt... ${err}`));
                    }
                    callback();
                });
            }
            else{
                callback();
            }
        });
};