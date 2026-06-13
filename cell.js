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
    this.revealedAt = null;
    this.flaggedAt = null;

    // Eased 0..1 progress since `at`, over `dur` ms. Returns 1 when not started.
    function anim(at, dur) {
        if (at === null) return 1;
        return easeOutBack(constrain((millis() - at) / dur, 0, 1));
    }

    this.show = function() {
        const p = PALETTES[THEME.current];
        const cx = this.x + this.w / 2;
        const cy = this.y + this.h / 2;

        // Track transitions so reveal/flag pop wherever the flags get set.
        if (this.revealed && this.revealedAt === null) this.revealedAt = millis();
        if (this.flagged && this.flaggedAt === null) this.flaggedAt = millis();
        if (!this.flagged) this.flaggedAt = null;

        if (this.flagged) {
            fill(...p.unrevealed);
            rect(this.x, this.y, this.w, this.h);
            const fs = anim(this.flaggedAt, 200);
            push();
            translate(cx, cy);
            drawingContext.scale(fs, fs);
            fill(255, 0, 0);
            textAlign(CENTER, CENTER);
            textSize(16);
            text('🚩', 0, 0);
            pop();
            return;
        }

        if (!this.revealed) {
            fill(...p.unrevealed);
            rect(this.x, this.y, this.w, this.h);
            return;
        }

        // Revealed: pop the content in from the cell center.
        const s = anim(this.revealedAt, 180);
        push();
        translate(cx, cy);
        drawingContext.scale(s, s);
        translate(-cx, -cy);

        if (this.bomb) {
            fill(...p.bomb);
            rect(this.x, this.y, this.w, this.h);
            textAlign(CENTER, CENTER);
            textSize(20);
            text('💣', cx, cy);
        } else if (this.number === 0) {
            fill(...p.revealedEmpty);
            rect(this.x, this.y, this.w, this.h);
        } else {
            fill(...p.revealedEmpty);
            rect(this.x, this.y, this.w, this.h);
            fill(getColor(this.number));
            textAlign(CENTER, CENTER);
            textSize(16);
            textStyle(BOLD);
            text(this.number, cx, cy);
        }
        pop();
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
