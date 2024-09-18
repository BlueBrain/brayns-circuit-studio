def add_vector(a: list[float], b: list[float]):
    sa = len(a)
    sb = len(b)
    if sa != sb:
        raise Exception(f"add_vector(a, b): a has a length of {sa}, but b has a length of {sb}!")
    result = []
    for i in range(sa):
        result.append(a[i] + b[i])
    return result

def scale_vector(a: list[float], scale: float):
    return [x*scale for x in a]

def dot_product(a: list[float], b: list[float]) -> float:
    sa = len(a)
    sb = len(b)
    if sa != sb:
        raise Exception(f"dot(a, b): a has a length of {sa}, but b has a length of {sb}!")
    result = 0
    for i in range(sa):
        result += a[i] * b[i]
    return result

def square_dist(a: list[float], b: list[float]) -> float:
    sa = len(a)
    sb = len(b)
    if sa != sb:
        raise Exception(f"dot(a, b): a has a length of {sa}, but b has a length of {sb}!")
    result = 0
    for i in range(sa):
        x = b[i] - a[i]
        result += x*x
    return result

def normalize(vec: list[float]):
    norm = sum([x*x for x in vec])
    if abs(norm - 1) > 1e-9 and norm > 0:
        for i in range(len(vec)):
            vec[i] /= norm
    return vec

def get_x_axis_from_quaternion(quaternion: list[float]):
    [qx, qy, qz, qw] = normalize(quaternion)
    return [
        1 - 2*(qz*qz + qy*qy),
        2*(qx*qy + qz*qw),
        2*(qx*qz - qy*qw)
    ]

def get_y_axis_from_quaternion(quaternion: list[float]):
    [qx, qy, qz, qw] = normalize(quaternion)
    return [
        2*(qx*qy - qz*qw),
        1 - 2*(qz*qz + qx*qx),
        2*(qy*qz + qx*qw)
    ]

def get_z_axis_from_quaternion(quaternion: list[float]):
    [qx, qy, qz, qw] = normalize(quaternion)
    return [
        2*(qy*qw + qx*qz),
        2*(qy*qz - qx*qw),
        1- 2*(qy*qy + qx*qx)
    ]

def get_axis_from_quaternion(quaternion: list[float]):
    [qx, qy, qz, qw] = normalize(quaternion)
    qx2 = qx*qx
    qy2 = qy*qy
    qz2 = qz*qz
    qxy = qx*qy
    qxz = qx*qz
    qxw = qx*qw
    qyz = qy*qz
    qyw = qy*qw
    qzw = qz*qw
    return [
        [
            1 - 2*(qz2 + qy2),
            2*(qxy + qzw),
            2*(qxz - qyw)
        ],
        [
            2*(qxy - qzw),
            1 - 2*(qz2 + qx2),
            2*(qyz + qxw)
        ],
        [
            2*(qyw + qxz),
            2*(qyz - qxw),
            1- 2*(qy2 + qx2)
        ]
    ]

