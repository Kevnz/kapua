module.exports = (client) => (typeName, schema = {}) => {
  if (!typeName) {
    throw new Error('Instance must have a type name specified');
  }
  const buildItem = (data = {}) => {
    const isNew = Object.keys(data).length === 0 || data.id === undefined;

    const newObj = {
      __changedProps: [],
      __dirty: false,
      __props: {},
      __isNew: isNew
    };

    if (schema.properties) {
      const keys = Object.keys(schema.properties);
      keys.forEach((k) => {
        Object.defineProperty(newObj, k, {
          get: function() {
            return this.__props[k];
          },
          set: function(value) {
            this.__dirty = true;
            this.__changedProps.push(k);
            this.__props[k] = value;
          }
        });
        newObj[k] = data[k] || null;
      });

      newObj.__keys = keys;
    }
    const instance = Object.assign(newObj, {
      get: function(prop) {
        return this.__props[prop];
      },
      set: function(prop, value) {
        this.__props[prop] = value;
      },
      get typeOf() {
        return typeName;
      },
      save: async function() {
        const saveresult = await client[this.__isNew ? 'post' : 'put'](
          this.__props
        );
        // if new set id, it should come from location header
        this.__changedProps = [];
        this.__dirty = false;
        this.__isNew = false;
        Object.defineProperty(this, 'id', {
          get: function() {
            return this.__props.id;
          }
        });
        return true;
      }
    });
    newObj.__isNew = isNew;

    return newObj;
  };
  return {
    get: async (id) => {
      if (id && typeof id !== 'object') {
        // get item from api and build item
        const data = await client.get(`${typeName}/${id}`);
        return buildItem(data);
      } else if (id && typeof id === 'object') {
        return buildItem(id);
      }
      return buildItem();
    }
  };
};
