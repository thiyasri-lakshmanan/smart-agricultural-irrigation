public class CanalLink {
    private final String linkId;
    private final String fromNode;
    private final String toNode;
    private boolean working;

    public CanalLink(String linkId, String fromNode,
                     String toNode, boolean working) {
        this.linkId = linkId;
        this.fromNode = fromNode;
        this.toNode = toNode;
        this.working = working;
    }

    public String getLinkId() { return linkId; }
    public String getFromNode() { return fromNode; }
    public String getToNode() { return toNode; }
    public boolean isWorking() { return working; }
    public void setWorking(boolean working) { this.working = working; }

    public String getOtherNode(String node) {
        if (fromNode.equals(node)) return toNode;
        return fromNode;
    }
}
