const PALETTES = {
    dark: {
        unrevealed: [55, 60, 90],
        revealedEmpty: [35, 40, 65],
        bomb: [180, 40, 60],
        numbers: [
            null,
            [100, 160, 255],
            [80, 215, 110],
            [255, 85, 85],
            [175, 100, 255],
            [255, 210, 60],
            [70, 215, 215],
            [255, 155, 55],
            [175, 175, 185],
        ]
    },
    light: {
        unrevealed: [240, 242, 248],
        revealedEmpty: [195, 200, 210],
        bomb: [220, 60, 60],
        numbers: [
            null,
            [0, 0, 200],
            [0, 130, 0],
            [200, 0, 0],
            [90, 0, 160],
            [140, 0, 0],
            [0, 130, 130],
            [0, 0, 0],
            [70, 70, 70],
        ]
    }
};

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
        const p = PALETTES[THEME.current];

        if (this.flagged) {
            fill(...p.unrevealed);
            rect(this.x, this.y, this.w, this.h);
            fill(255, 0, 0);
            textAlign(CENTER, CENTER);
            textSize(16);
            text('🚩', this.x + this.w / 2, this.y + this.h / 2);
            return;
        }
        if (!this.revealed) {
            fill(...p.unrevealed);
            rect(this.x, this.y, this.w, this.h);
        }
        if (this.revealed && !this.bomb && this.number === 0) {
            fill(...p.revealedEmpty);
            rect(this.x, this.y, this.w, this.h);
        }
        if (this.revealed && this.bomb) {
            fill(...p.bomb);
            rect(this.x, this.y, this.w, this.h);
            textAlign(CENTER, CENTER);
            textSize(20);
            text('💣', this.x + this.w / 2, this.y + this.h / 2);
        }
        if (this.revealed && !this.bomb && this.number > 0) {
            fill(...p.revealedEmpty);
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
    const c = PALETTES[THEME.current].numbers[number];
    return c ? color(...c) : color(0);
}
