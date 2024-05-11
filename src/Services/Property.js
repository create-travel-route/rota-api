import { Property } from '../Models/Property';

// create property
const create = async ({
  title,
  description,
  category,
  address,
  lng,
  lat,
  budget,
  rating,
  hostId
}) => {
  const property = await Property.create({
    title,
    description,
    category,
    address,
    location: {
      type: 'Point',
      coordinates: [lng, lat]
    },
    budget,
    rating,
    hostId
  });

  return property;
};

// all properties
const find = async (where) => {
  const properties = await Property.find(where).exec();

  return properties;
};

// find one by where
const findOne = async (where) => {
  if (typeof where !== 'object') {
    throw Error('Invalid find one filter');
  }
  const property = await Property.findOne(where).exec();

  return property;
};

// find one property by id
const findOneById = async (id) => {
  const property = await Property.findById(id).exec();

  return property;
};

// update property
const update = async ({ title, description, category, address, location }, id) => {
  const property = await findOneById(id);

  Object.assign(property, { title, description, category, address, location });
  return await property.save();
};

// delete property
const deleteProperty = async (id) => {
  const propertyToDelete = await findOneById(id);

  if (!propertyToDelete) {
    throw Error("Property not found or you don't have permission.");
  }

  propertyToDelete.deletedAt = new Date();
  propertyToDelete.updatedAt = new Date();

  propertyToDelete.save();

  return 'OK';
};

const getPropertiesByLocation = async ({ lon1, lat1, lon2, lat2 }) => {
  const properties = await find({
    location: {
      $geoWithin: {
        $box: [
          [lon1, lat1],
          [lon2, lat2]
        ]
      }
    }
  });

  return properties;
};

function calculateDistance(coord1, coord2) {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;

  const earthRadius = 6371; // Dünya yarıçapı km cinsinden
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c;

  return distance;
}

async function createMatrix(properties) {
  const size = properties.length;
  const matrix = [];

  for (let i = 0; i < size; i++) {
    matrix[i] = [];

    for (let j = 0; j < size; j++) {
      const distance = calculateDistance(
        properties[i].location.coordinates,
        properties[j].location.coordinates
      );
      if (i === j) {
        matrix[i][j] = 0; // Kendi kendine mesafe sıfır olmalı
      } else {
        matrix[i][j] = {
          name: properties[j].title, // Mekan ismi
          distance: distance, // Mesafe
          budget: properties[j].budget // Bütçe
        };
      }
    }
  }

  return matrix;
}

async function floydWarshallWithBudgetConstraint(matrix, budgetLimit) {
  const size = matrix.length;

  const dist = Array.from({ length: size }, () => Array(size).fill(Infinity));
  const Next = Array.from({ length: size }, () => Array(size).fill(-1));
  const cost = Array.from({ length: size }, () => Array(size).fill(0));

  // Başlangıç mesafelerini, bütçeleri ve maliyetleri ayarla
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (i === j) {
        dist[i][j] = 0; // Kendi kendine mesafe sıfır olmalı
        cost[i][j] = 0; // Kendi kendine maliyet sıfır olmalı
      } else if (matrix[i][j].budget <= budgetLimit) {
        dist[i][j] = matrix[i][j].distance;
        Next[i][j] = j;
        cost[i][j] = matrix[i][j].budget;
      }
    }
  }

  for (let k = 0; k < size; k++) {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (dist[i][j] > dist[i][k] + dist[k][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
          Next[i][j] = Next[i][k];
        }
      }
    }
  }

  return { dist, cost, Next };
}

async function createRoute(matrix) {
  const numVertices = matrix.length;
  let path = [0]; // Rota başlangıcı olarak 0. elemanı ekliyoruz.
  let visited = new Array(numVertices).fill(false); // Ziyaret edilen düğümleri takip etmek için
  visited[0] = true; // Başlangıç düğümü ziyaret edildi olarak işaretlenir

  // Matrisin her satırındaki en küçük elemanı bulup rotaya ekleyen fonksiyon
  function findNextVertex(matrix, lastVertex) {
    let min = Infinity;
    let minIndex = -1;

    for (let i = 0; i < numVertices; i++) {
      if (!visited[i] && matrix[lastVertex][i] < min) {
        min = matrix[lastVertex][i];
        minIndex = i;
      }
    }

    // Seçilen elemanları null yapma ve ziyaret edilen düğümü işaretleme
    for (let i = 0; i < numVertices; i++) {
      matrix[lastVertex][i] = null; // Satırı null yap
    }
    visited[minIndex] = true; // Düğüm ziyaret edildi olarak işaretlenir

    return minIndex;
  }

  // Rota oluşturma
  let lastVertex = 0;
  while (path.length < numVertices) {
    let nextVertex = findNextVertex(matrix, lastVertex);
    if (nextVertex !== -1) {
      path.push(nextVertex);
      lastVertex = nextVertex;
    } else {
      break;
    }
  }

  return path;
}

const PropertyService = {
  create,
  find,
  findOne,
  findOneById,
  update,
  deleteProperty,
  getPropertiesByLocation,
  createMatrix,
  floydWarshallWithBudgetConstraint,
  createRoute
};

export default PropertyService;
