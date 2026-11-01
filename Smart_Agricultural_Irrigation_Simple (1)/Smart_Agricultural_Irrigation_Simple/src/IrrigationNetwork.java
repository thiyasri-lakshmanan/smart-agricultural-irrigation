import java.util.*;

public class IrrigationNetwork {
    private final Map<String, List<CanalLink>> adjacency = new HashMap<>();
    private final Map<String, CanalLink> links = new LinkedHashMap<>();

    public void addNode(String nodeId) {
        adjacency.putIfAbsent(nodeId, new ArrayList<CanalLink>());
    }

    public void addLink(CanalLink link) {
        addNode(link.getFromNode());
        addNode(link.getToNode());
        adjacency.get(link.getFromNode()).add(link);
        adjacency.get(link.getToNode()).add(link);
        links.put(link.getLinkId(), link);
    }

    public void updateLink(String linkId, boolean working) {
        CanalLink link = links.get(linkId);
        if (link == null) throw new IllegalArgumentException("Unknown canal link.");
        link.setWorking(working);
    }

    public CanalLink getLink(String linkId) {
        return links.get(linkId);
    }

    public Map<String, CanalLink> getLinks() {
        return Collections.unmodifiableMap(links);
    }

    public Set<String> reachableNodes(String source) {
        Set<String> visited = new HashSet<>();
        Queue<String> queue = new LinkedList<>();
        visited.add(source);
        queue.offer(source);

        while (!queue.isEmpty()) {
            String current = queue.poll();
            List<CanalLink> neighbours = adjacency.get(current);
            if (neighbours == null) continue;

            for (CanalLink link : neighbours) {
                if (!link.isWorking()) continue;
                String next = link.getOtherNode(current);
                if (visited.add(next)) queue.offer(next);
            }
        }
        return visited;
    }

    public boolean isReachable(String reservoirNode, String fieldNode) {
        return reachableNodes(reservoirNode).contains(fieldNode);
    }
}
