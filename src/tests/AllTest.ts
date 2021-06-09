///<reference path="../Settings.ts" />
///<reference path="../system/Timer.ts" />
//declare var test, ok, equal, notEqual, QUnit.test, start,QUnit

import {test} from 'qunit';
import { b2Vec2 } from '../system/Physics';
import { Utilies } from '../system/Utilies';

QUnit.module( "Timer.js" );
test("Asynchronous", (assert) => {
    var timePeroid = 1000;
    var t = new Timer(timePeroid);
    
    setTimeout(() => {
        t.update();
        assert.notEqual(t.getTimeLeft(), timePeroid , "getTimeLeft()");
        assert.equal(t.hasTimePeriodPassed(), true,"hasTimePeriodPassed()");
        assert.equal(t.getTimeLeft(), timePeroid , "getTimeLeft()");

        QUnit.start();
    }, timePeroid+200);
});

test("Reset", (assert) => {
     
    var timePeroid = 1000;
    var t = new Timer(timePeroid);
     
    
    setTimeout(() => {
        t.update();
        assert.notEqual(t.getTimeLeft(), timePeroid , "getTimeLeft()");
        t.reset();
        assert.equal(t.getTimeLeft(), timePeroid , "getTimeLeft()");

        QUnit.start();
    }, timePeroid);
});

test( "time lenght", (assert) => {
     
    var timePeroid = 5000;
    var t = new Timer(timePeroid+1);
     
    
    setTimeout(() => {
        t.update();
        assert.equal(t.getTimeLeft(), 0 , "getTimeLeft()");


        QUnit.start();
    }, timePeroid);
});



QUnit.module( "Utitlies" );
test( " remove item from array ", (assert) => {
     
    var arr = [1,2,3,4,5];
     
    Utilies.deleteFromCollection(arr, 1);
    Utilies.deleteFromCollection(arr, 3);
    var t = arr[1] == 3 && arr[3] == null;


    assert.ok(t);
});

test( " Angle converts ", (assert) => {
     
    var angleInDegrees = 45;
    var angleInRadins = 0.7853981633974483;

    assert.equal(Utilies.toRadians(angleInDegrees),angleInRadins, "Degrees to radins " );
    assert.equal(Utilies.toDegrees(angleInRadins),angleInDegrees, " radins to degrees " );

});

test( " angles  to vectors ", (assert) => {
     
    var angleInRadins = Utilies.toRadians(0);
    var v = Utilies.angleToVector(angleInRadins)

    assert.equal(v.x,1);
    assert.equal(v.y,0);

    var angleInRadins = Utilies.toRadians(45);
    var v = Utilies.angleToVector(angleInRadins)

    assert.equal(v.x,0.7071067811865476);
    assert.equal(v.y,0.7071067811865475);

});


test( " vectors to angles  ", (assert) => {
     
   
    var v = new b2Vec2(0.7, 0.7);
    var angle = Utilies.vectorToAngle(v);

    assert.equal(angle,Utilies.toRadians(45));
   
});


