function Cell() {
    this.x = 0;
    this.y = 0;
    this.w = CELLWIDTH;
    this.h = CELLHEIGHT;
    this.bomb = false;
    this.revealed = false;
    this.number = 0;
    this.flagged = false;

    this.show = function() {
        if (this.flagged) {
            fill(255);
            rect(this.x, this.y, this.w, this.h);
            fill(255, 0, 0);
            textAlign(CENTER, CENTER);
            textSize(16);
            text('🚩', this.x + this.w / 2, this.y + this.h / 2);
            return;
        }
        if (!this.revealed) {
            fill(255);
            rect(this.x, this.y, this.w, this.h);
        }
        if (this.revealed && !this.bomb && this.number === 0) {
            fill(220);
            rect(this.x, this.y, this.w, this.h);
        }
        if (this.revealed && this.bomb) {
            fill(255, 102, 102);
            rect(this.x, this.y, this.w, this.h);
            textAlign(CENTER, CENTER);
            textSize(20);
            text('💣', this.x + this.w / 2, this.y + this.h / 2);
        }
        if (this.revealed && !this.bomb && this.number > 0) {
            fill(220);
            rect(this.x, this.y, this.w, this.h);
            fill(getColor(this.number));
            textAlign(CENTER, CENTER);
            textSize(16);
            textStyle(BOLD);
            text(this.number, this.x + this.w / 2, this.y + this.h / 2);
        }
    };

    this.setPosition = function(x, y) {
        this.x = x;
        this.y = y;
    };
}

function getColor(number) {
    switch (number) {
        case 1: return color(0, 0, 255);
        case 2: return color(0, 128, 0);
        case 3: return color(255, 0, 0);
        case 4: return color(128, 0, 128);
        case 5: return color(128, 128, 0);
        case 6: return color(0, 255, 255);
        case 7: return color(255, 165, 0);
        case 8: return color(128, 128, 128);
        default: return color(0);
    }
}
