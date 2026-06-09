export class Utils {
    static getCoords(node: cc.Node): cc.Vec2 {
        const worldPos = node.convertToWorldSpaceAR(cc.v2(0, 0));

        let canvas = cc.find('Canvas');
        return canvas.convertToNodeSpaceAR(worldPos);
    }
}