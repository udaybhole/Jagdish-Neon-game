/**
 * Finds the optimal paths and distances for all points in the grid from all 4 corners.
 * @param {number[][]} grid - 10x10 maze grid (0: empty, 1: obstacle).
 * @returns {object} - Object containing optimal paths and meeting points.
 */
function findOptimalPaths(grid) {
    const rows = 10;
    const cols = 10;

    const directions = [
        [1, 0],  // Down
        [-1, 0], // Up
        [0, 1],  // Right
        [0, -1],  // Left
        [1,1],
        [-1,-1],
        [1,-1],
        [-1,1]
    ];

    const corners = [
        { name: "Top Left", coords: [0, 0] },
        { name: "Top Right", coords: [0, cols - 1] },
        { name: "Bottom Left", coords: [rows - 1, 0] },
        { name: "Bottom Right", coords: [rows - 1, cols - 1] }
    ];

    const findPathsFromCorner = (start) => {
        const queue = [[...start, 0]];
        const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
        const distances = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
        const paths = Array.from({ length: rows }, () => Array(cols).fill(null));

        visited[start[0]][start[1]] = true;
        distances[start[0]][start[1]] = 0;
        paths[start[0]][start[1]] = [start];

        while (queue.length > 0) {
            const [currentRow, currentCol, distance] = queue.shift();
            const currentPath = paths[currentRow][currentCol];

            for (const [dRow, dCol] of directions) {
                const newRow = currentRow + dRow;
                const newCol = currentCol + dCol;

                if (
                    newRow >= 0 && newRow < rows &&
                    newCol >= 0 && newCol < cols &&
                    grid[newRow][newCol] === 0 &&
                    !visited[newRow][newCol]
                ) {
                    visited[newRow][newCol] = true;
                    distances[newRow][newCol] = distance + 1;
                    paths[newRow][newCol] = [...currentPath, [newRow, newCol]];
                    queue.push([newRow, newCol, distance + 1]);
                }
            }
        }

        return { distances, paths };
    };

    // Calculate paths from all corners
    const cornerResults = corners.map((corner, index) => ({
        ...corner,
        playerId: index + 1,
        ...findPathsFromCorner(corner.coords)
    }));

    // Find the best meeting point
    let bestMeetingPoint = null;
    let minRange = Infinity;
    let bestPaths = null;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === 1) continue; // Skip obstacles

            const cornerData = cornerResults.map(result => ({
                playerId: result.playerId,
                distance: result.distances[r][c],
                path: result.paths[r][c]
            }));

            // Skip if any path is impossible
            if (cornerData.some(cd => cd.distance === Infinity)) continue;

            const distances = cornerData.map(cd => cd.distance);
            const minDist = Math.min(...distances);
            const maxDist = Math.max(...distances);
            const range = maxDist - minDist;
            const totalDistance = distances.reduce((sum, d) => sum + d, 0);

            if (
                range < minRange || 
                (range === minRange && totalDistance < (bestMeetingPoint?.totalDistance || Infinity))
            ) {
                minRange = range;
                bestMeetingPoint = [r, c];
                bestPaths = cornerData;
            }
        }
    }

    return {
        meetingPoint: bestMeetingPoint,
        paths: bestPaths,
        totalDistance: bestPaths.reduce((sum, p) => sum + p.distance, 0)
    };
}

module.exports = findOptimalPaths;
