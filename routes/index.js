var express = require('express');
var router = express.Router();
const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/workshoptdc';

/* GET home page. */
router.get('/', function(req, res, next) {

	const results = [];
  
  pg.connect(connectionString, (err, client, done) => {
	
	if(err) {
		done();
		console.log(err);
		return res.status(500).json({success: false, data: err});
	}
   
    const query = client.query('SELECT * FROM pessoa order by pessoaid');

   
    query.on('row', (row) => {
    	results.push(row);
    });
    
    query.on('end', () => {
    	done();
    	res.render('index', { title: 'Lista de Pessoas', docs: results });
    });
  });
});

router.get('/new', function(req,res,next){
	res.render('new', { title: 'Novo Cadastro', doc: {"pessoaid": "" ,"nome":"","idade":""}, action:'/new'});
});

router.post('/new', (req, res, next) => {
	console.log('chamou o post correto!');
	const results = [];

  const data = {nome: req.body.nome, idade: req.body.idade};
  
  
  pg.connect(connectionString, (err, client, done) => {

    if(err) {
    	done();
    	console.log(err);
    	return res.status(500).json({success: false, data: err});
    }

   client.query('INSERT INTO pessoa(nome, idade) values($1, $2)',[data.nome, data.idade]);

    const query = client.query('SELECT * FROM pessoa ORDER BY pessoaid');
 
    query.on('row', (row) => {
    	results.push(row);
    });
   
    query.on('end', () => {
    	done();
    	res.redirect('/');
      //return res.json(results);
    });
  });
});

router.get('/delete/:pessoaid', (req, res, next) => {

	const results = [];

  var id = req.params.pessoaid;

  pg.connect(connectionString, (err, client, done) => {

    if(err) {
    	done();
    	console.log(err);
    	return res.status(500).json({success: false, data: err});
    }
    
    client.query('DELETE FROM pessoa WHERE pessoaid=($1)', [id]);
    
    var query = client.query('SELECT * FROM pessoa ORDER BY pessoaid');
    
    query.on('row', (row) => {
    	results.push(row);
    });

    query.on('end', () => {
    	done();
    	res.redirect('/');

    });
  });
});

router.get('/edit/:pessoaid', (req,res,next) => {

	const results = [];
	const id = req.params.pessoaid;

	pg.connect(connectionString, (err, client, done) => {

   if(err) {
    done();
    console.log(err);
    return res.status(500).json({success: false, data: err});
  }

    const query = client.query('SELECT * FROM pessoa WHERE pessoaid=($1)', [id]);

    query.on('row', (row) => {
    	results.push(row);
    });

    query.on('end', () => {
    	done();
    	res.render('new', { title: 'Edição de Pessoa', doc: results[0], action: '/edit/' + results[0].pessoaid });
    });
  });
});

router.post('/edit/:pessoaid', function(req, res) {
	var id = req.params.pessoaid;
	var nome = req.body.nome;
	var idade = parseInt(req.body.idade);

	console.log(id);
	const results = [];

	const data = {nome: req.body.nome, idade: req.body.idade}

	pg.connect(connectionString, (err, client, done) => {

		if(err) {
			done();
			console.log(err);
			return res.status(500).json({success: false, data: err});
		}

		client.query('UPDATE pessoa SET nome=($1), idade=($2) WHERE pessoaid=($3)',
			[data.nome, data.idade, id]);

		const query = client.query('SELECT * FROM pessoa ORDER BY pessoaid');

		query.on('row', (row) => {
			results.push(row);
		});

		query.on('end', function() {
			done();
			res.redirect('/');
      
		});
	});

});

module.exports = router;