import bluepy
from calc import square_dist

def list(path: str, targets: list[str]):
    try:
        circuit = bluepy.Circuit(path)
        ids = []
        if len(targets) > 0:
            idsSet = set([])
            for target in targets:
                for id in circuit.cells.ids(target):
                    idsSet.add(id)
            ids = [id for id in idsSet]
        else:
            ids = circuit.cells.ids()
        print(ids)
        positions = circuit.cells.get(
            ids, 
            properties=[bluepy.Cell.X, bluepy.Cell.Y, bluepy.Cell.Z]
        ).values.tolist()
        result = []
        for i in range(len(ids)):
            result.append([int(ids[i]), positions[i]])
        return result
    except:
        print("Not a circuit:", path)
        return []

def clip_gids(cells, center, axis, dimension, cells_per_slice):
    [width, _height, depth] = dimension
    thickness = depth / 2
    [cx, cy, cz] = center
    [[tx, ty, tz], [_x, _y, _z], [nx, ny, nz]] = axis
    gids = []
    best_gids = [-1] * cells_per_slice
    best_dist = [1e99] * cells_per_slice
    step = width / cells_per_slice if cells_per_slice > 0 else 0
    x0 = cx - tx * (width - step) / 2
    y0 = cy - ty * (width - step) / 2
    z0 = cz - tz * (width - step) / 2
    centers = [ 
        [
            x0 + tx * i * step,
            y0 + ty * i * step,
            z0 + tz * i * step
        ]
        for i in range(cells_per_slice)
    ]
    for cell in cells:
        [id, [x, y, z]] = cell
        dot = (x - cx)*nx + (y - cy)*ny + (z - cz)*nz
        if abs(dot) < thickness:
            if cells_per_slice > 0:
                for i in range(cells_per_slice):
                    dist = square_dist([x, y, z], centers[i])
                    if dist < best_dist[i]:
                        best_dist[i] = dist
                        best_gids[i] = id
            else:
                gids.append(id)
    return best_gids if cells_per_slice > 0 else gids