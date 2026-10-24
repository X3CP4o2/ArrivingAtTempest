"use strict";
class Vector {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    SetX(value) {
        return new Vector(value, this.y, this.z);
    }
    SetY(value) {
        return new Vector(this.x, value, this.z);
    }
    SetZ(value) {
        return new Vector(this.x, this.y, value);
    }
    Length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    Length2D() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    Normalize() {
        const length = this.Length();
        return this.Divide(length);
    }
    Normalize2D() {
        const length = this.Length2D();
        return new Vector(this.x / length, this.y / length, this.z);
    }
    Clone() {
        return new Vector(this.x, this.y, this.z);
    }
    Add(other) {
        if (other instanceof Vector) {
            return new Vector(this.x + other.x, this.y + other.y, this.z + other.z);
        }
        else {
            return new Vector(this.x + other, this.y + other, this.z + other);
        }
    }
    Subtract(other) {
        if (other instanceof Vector) {
            return new Vector(this.x - other.x, this.y - other.y, this.z - other.z);
        }
        else {
            return new Vector(this.x - other, this.y - other, this.z - other);
        }
    }
    Divide(other) {
        if (other instanceof Vector) {
            return new Vector(this.x / other.x, this.y / other.y, this.z / other.z);
        }
        else {
            return new Vector(this.x / other, this.y / other, this.z / other);
        }
    }
    Multipy(other) {
        if (other instanceof Vector) {
            return new Vector(this.x * other.x, this.y * other.y, this.z * other.z);
        }
        else {
            return new Vector(this.x * other, this.y * other, this.z * other);
        }
    }
    Direction2D(other) {
        return other.Subtract(this).Normalize2D();
    }
    ToArray() {
        return [this.x, this.y, this.z];
    }
    Distance2D(other) {
        return other.Subtract(this).Length2D();
    }
    static FromArray(vector) {
        if (vector) {
            return new Vector(vector[0], vector[1], vector[2]);
        }
        else {
            return null;
        }
    }
}
