const connection = require('../database/connection');

module.exports = {
  async index(req, res) {
    const { page = 1 } = req.query;

    const [count] = await connection('incidents')
      .count();

    const incidents = await connection('incidents')
    .join('ongs', 'incidents.ong_id', '=', 'ongs.id')
    .limit(5)
    .offset((page - 1)* 5)
    .select(['incidents.*', 'ongs.name', 'ongs.email', 'ongs.whatsapp', 'ongs.city', 'ongs.uf']);

    res.header('X-Total-Count', count['count(*)']);

    return res.json(incidents);
  },

  async store(req, res) {
    const { title, description, value } = req.body;
    const ong_id = req.headers.authorization;

    const incident =  await connection('incidents').insert({
      title,
      description,
      value,
      ong_id
    });

    return res.json(incident);
  },

  async delete(req,res) {
    const { id } = req.params;
    const ong_id = req.headers.authorization;

    const incident = await connection('incidents')
      .where('id', id)
      .select('ong_id')
      .first();

    if(incident.ong_id !== ong_id){
      return res.status(401).json({ err: 'Operação não permitida'});
    }

    await connection('incidents').where('id',  id).delete();

    return res.status(204).send();
  },

  async put(req,res) {
    const { id } = req.params;
  }
};
