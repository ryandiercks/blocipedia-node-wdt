'use strict';
module.exports = (sequelize, DataTypes) => {
  const Wiki = sequelize.define('Wiki', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    body: {
      type: DataTypes.STRING,
      allowNull: false
    },
    private: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});
  Wiki.associate = function(models) {
    // associations can be defined here
    Wiki.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE"
    });

    Wiki.hasMany(models.Collaborator, {
      foreignKey: "wikiId",
      as: 'collaborators'
    });

  };

  Wiki.addScope("allWikis", (userId) => {
    return {
      where: { userId: userId},
      order: [["createdAt", "DESC"]]
    }
  });

  Wiki.addScope("privateWikis", (userId) => {
    return {
      where: { userId: userId},
      where: { private: true},
      order: [["createdAt", "DESC"]]
    }
  });

  return Wiki;
};
