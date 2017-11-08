import Connection from '../connection';

test('Retrieve category title', () => {
  const connection = Connection.create({
    single: {
      data: {
        category: {
          7: {
            id: 7,
            name: 'Nature',
            slug: 'nature',
            type: 'category',
            link: 'http://example.com/category/nature',
          },
        },
      },
    },
  });
  expect(connection.single.get('category').get(7).name).toBe('Nature');
  expect(connection.single.get('category', 7).name).toBe('Nature');
});

test('Retrieve nested entities', () => {
  const connection = Connection.create({
    single: {
      data: {
        category: {
          3: {
            id: 3,
            link: 'https://demo.worona.org/wp-cat/photography/',
            name: 'Photography',
            slug: 'photography',
            type: 'category',
          },
          8: {
            id: 8,
            link: 'https://demo.worona.org/wp-cat/travel/',
            name: 'Travel',
            slug: 'travel',
            type: 'category',
          },
        },
        tag: {
          10: {
            id: 10,
            link: 'https://demo.worona.org/tag/gullfoss/',
            name: 'Gullfoss',
            slug: 'gullfoss',
            type: 'tag',
          },
        },
        media: {
          62: {
            id: 62,
            mimeType: 'image/jpeg',
            title: 'iceland',
            original: {
              height: 123,
              width: 213,
              filename: '2016/11/Iceland-test.jpg',
              url: 'https://demo.worona.org/wp-content/uploads/2016/11/Iceland-test.jpg',
            },
            sizes: [
              {
                height: 123,
                width: 213,
                filename: '2016/11/Iceland-test.jpg',
                url: 'https://demo.worona.org/wp-content/uploads/2016/11/Iceland-test.jpg',
              },
              {
                height: 250,
                width: 350,
                filename: '2016/11/Iceland-test-250.jpg',
                url: 'https://demo.worona.org/wp-content/uploads/2016/11/Iceland-test-250.jpg',
              },
            ],
            creationDate: new Date('2016-11-25T18:33:33'),
            slug: 'iceland-test',
            link: 'https://demo.worona.org/the-beauties-of-gullfoss/iceland-test/',
            author: 2,
            alt: 'iceland',
          },
        },
        author: {
          4: {
            id: 4,
            name: 'Alan',
            slug: 'alan',
            description: 'Alan is a WordPress enthusiast who enjoys travelling, music and pizza.',
            link: 'http://example.com/author/alan/',
          },
        },
        post: {
          60: {
            id: 60,
            creationDate: new Date('2016-11-25T18:31:11'),
            modificationDate: new Date('2017-10-02T14:23:48'),
            title: 'The Beauties of Gullfoss',
            slug: 'the-beauties-of-gullfoss',
            type: 'post',
            link: 'http://example.com/the-beauties-of-gullfoss/',
            content: '<p>Gullfoss is a waterfall located in the canyon of the Hvita</p>',
            excerpt: '<p>Gullfoss is a waterfall</p>',
            author: 4,
            featured: 62,
            taxonomies: {
              category: [3, 8],
              tag: [10],
            },
          },
        },
      },
    },
  });
  expect(connection.single.get('post').get(60).author.name).toBe('Alan');
  expect(connection.single.get('post', 60).author.name).toBe('Alan');
  expect(connection.single.get('post', 60).taxonomies.get('category')[0].name).toBe('Photography');
  expect(connection.single.get('post', 60).featured.original.height).toBe(123);
});
